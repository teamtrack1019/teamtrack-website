<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

$to = 'teamtrack.software@hotmail.com';
$name = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : '';
$company = isset($_POST['company']) ? trim(strip_tags($_POST['company'])) : '';
$email = isset($_POST['email']) ? trim(filter_var($_POST['email'], FILTER_SANITIZE_EMAIL)) : '';
$phone = isset($_POST['phone']) ? trim(strip_tags($_POST['phone'])) : '';
$interest = isset($_POST['interest']) ? trim(strip_tags($_POST['interest'])) : 'Allgemein';
$message = isset($_POST['message']) ? trim(strip_tags($_POST['message'])) : '';

if (empty($name) || empty($company) || empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Bitte füllen Sie alle Pflichtfelder korrekt aus.']);
    exit;
}

$subject = "Neue Projektanfrage: " . $company . " - " . $name;

$body = "Es ist eine neue Projektanfrage über die TeamTrack-Website eingegangen:\n\n";
$body .= "--------------------------------------------------\n";
$body .= "Name:          " . $name . "\n";
$body .= "Firma:         " . $company . "\n";
$body .= "E-Mail:        " . $email . "\n";
$body .= "Telefon:       " . ($phone ? $phone : 'Nicht angegeben') . "\n";
$body .= "Interesse an:  " . $interest . "\n";
$body .= "--------------------------------------------------\n\n";
$body .= "Nachricht / Details:\n" . ($message ? $message : 'Keine Nachricht angegeben') . "\n\n";
$body .= "Datum/Uhrzeit: " . date('d.m.Y H:i:s') . "\n";
$body .= "IP-Adresse:    " . (isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'Unbekannt') . "\n";

$headers = [];
$headers[] = 'From: TeamTrack Webform <noreply@teamtrack.cloud>';
$headers[] = 'Reply-To: ' . $name . ' <' . $email . '>';
$headers[] = 'X-Mailer: PHP/' . phpversion();
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';

$mailSent = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, implode("\r\n", $headers));

if ($mailSent) {
    echo json_encode(['success' => true, 'message' => 'Anfrage erfolgreich gesendet!']);
} else {
    echo json_encode(['success' => true, 'fallback' => true, 'message' => 'Anfrage entgegengenommen.']);
}
?>
