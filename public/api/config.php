<?php
// Configuración del formulario de cita. El secreto de los tokens se genera solo en api/.data/ (no se publica).
return [
    'to'        => 'sonia' . '@' . 'valdelvira-abogados.com',
    'from'      => 'no-responder' . '@' . 'valdelvira-abogados.com',
    'from_name' => 'Valdelvira Abogados',
    'hosts'     => ['valdelvira-abogados.com', 'www.valdelvira-abogados.com', 'preview.valdelvira-abogados.com'],
    'privacy'   => 'https://valdelvira-abogados.com/politica-de-privacidad/',
    'site'      => 'https://valdelvira-abogados.com',
];
