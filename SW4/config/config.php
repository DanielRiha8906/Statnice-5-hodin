<?php

declare(strict_types=1);

/**
 * Centrální konfigurace aplikace.
 *
 * Databáze používá SQLite, což je relační databáze vhodná pro jednoduché školní
 * nasazení bez nutnosti provozu externího serveru. Aplikační vrstva ale používá
 * PDO, takže přechod na MySQL by byl relativně přímočarý.
 */

return [
    'app_name' => 'SkladPro',
    'database' => [
        'driver' => 'sqlite',
        'database' => dirname(__DIR__) . '/data/warehouse.sqlite',
    ],
    'roles' => [
        'admin' => 'Správce',
        'worker' => 'Skladník',
    ],
    'order_statuses' => [
        'new' => 'Nová',
        'processing' => 'Ve zpracování',
        'completed' => 'Dokončená',
        'cancelled' => 'Zrušená',
    ],
];

