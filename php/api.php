<?php
/**
 * CalendarWeb - PHP API Handler
 * 
 * This file provides server-side functionality for the calendar application.
 * It can be extended to handle:
 * - Database storage for tasks and deadlines
 * - User authentication
 * - Data synchronization across devices
 * - Export/import functionality
 * - Email notifications for deadlines
 */

// Set headers for JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Get the request method
$method = $_SERVER['REQUEST_METHOD'];

// Get the requested endpoint
$request = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';

// Route requests
switch ($method) {
    case 'GET':
        handleGet($request);
        break;
    case 'POST':
        handlePost($request);
        break;
    case 'PUT':
        handlePut($request);
        break;
    case 'DELETE':
        handleDelete($request);
        break;
    default:
        respondWithError('Method not allowed', 405);
        break;
}

/**
 * Handle GET requests
 */
function handleGet($endpoint) {
    switch ($endpoint) {
        case 'tasks':
            // Get all tasks
            // TODO: Implement database query
            $tasks = [];
            respondWithSuccess($tasks);
            break;
            
        case 'deadlines':
            // Get all deadlines
            // TODO: Implement database query
            $deadlines = [];
            respondWithSuccess($deadlines);
            break;
            
        case 'export':
            // Export data
            // TODO: Implement export functionality
            $data = [
                'tasks' => [],
                'deadlines' => []
            ];
            respondWithSuccess($data);
            break;
            
        default:
            respondWithError('Endpoint not found', 404);
            break;
    }
}

/**
 * Handle POST requests
 */
function handlePost($endpoint) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    switch ($endpoint) {
        case 'tasks':
            // Create a new task
            // TODO: Implement database insert
            respondWithSuccess(['id' => generateId(), 'message' => 'Task created successfully']);
            break;
            
        case 'deadlines':
            // Create a new deadline
            // TODO: Implement database insert
            respondWithSuccess(['id' => generateId(), 'message' => 'Deadline created successfully']);
            break;
            
        case 'import':
            // Import data
            // TODO: Implement import functionality
            respondWithSuccess(['message' => 'Data imported successfully']);
            break;
            
        case 'canvas-events':
            handleCanvasEventsRequest($data ?: []);
            break;

        case 'ics-fetch':
            handleIcsFetchRequest($data ?: []);
            break;
            
        default:
            respondWithError('Endpoint not found', 404);
            break;
    }
}

/**
 * Handle PUT requests
 */
function handlePut($endpoint) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    switch ($endpoint) {
        case 'tasks':
            // Update a task
            // TODO: Implement database update
            respondWithSuccess(['message' => 'Task updated successfully']);
            break;
            
        case 'deadlines':
            // Update a deadline
            // TODO: Implement database update
            respondWithSuccess(['message' => 'Deadline updated successfully']);
            break;
            
        default:
            respondWithError('Endpoint not found', 404);
            break;
    }
}

/**
 * Handle DELETE requests
 */
function handleDelete($endpoint) {
    switch ($endpoint) {
        case 'tasks':
            // Delete a task
            // TODO: Implement database delete
            respondWithSuccess(['message' => 'Task deleted successfully']);
            break;
            
        case 'deadlines':
            // Delete a deadline
            // TODO: Implement database delete
            respondWithSuccess(['message' => 'Deadline deleted successfully']);
            break;
            
        default:
            respondWithError('Endpoint not found', 404);
            break;
    }
}

/**
 * Proxy Canvas calendar events through the server to skip browser CORS limits
 */
function handleCanvasEventsRequest(array $payload) {
    $baseUrl = isset($payload['baseUrl']) ? trim($payload['baseUrl']) : '';
    $token = isset($payload['token']) ? trim($payload['token']) : '';
    $startDate = isset($payload['startDate']) ? $payload['startDate'] : '';
    $endDate = isset($payload['endDate']) ? $payload['endDate'] : '';
    $baseUrl = $baseUrl !== '' ? $baseUrl : 'https://canvas.instructure.com/';
    if ($token === '' || $startDate === '' || $endDate === '') {
        respondWithError('Missing Canvas credentials or date window.', 422);
    }

    $normalizedBase = normalise_base_url($baseUrl);
    $query = http_build_query([
        'start_date' => $startDate,
        'end_date' => $endDate,
        'per_page' => 100
    ], '', '&', PHP_QUERY_RFC3986);
    $targetUrl = $normalizedBase . 'api/v1/calendar_events?' . $query . '&include[]=assignment';

    $curl = curl_init($targetUrl);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($curl, CURLOPT_TIMEOUT, 20);
    curl_setopt($curl, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Authorization: Bearer ' . $token
    ]);

    $response = curl_exec($curl);
    if ($response === false) {
        $error = curl_error($curl);
        curl_close($curl);
        respondWithError('Canvas request failed: ' . $error, 500);
    }

    $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);

    if ($status < 200 || $status >= 300) {
        respondWithError('Canvas responded with ' . $status . ': ' . substr($response, 0, 300), $status);
    }

    $decoded = json_decode($response, true);
    if ($decoded === null && json_last_error() !== JSON_ERROR_NONE) {
        respondWithError('Canvas returned an unreadable payload.', 500);
    }

    respondWithSuccess($decoded);
}

function handleIcsFetchRequest(array $payload) {
    $url = isset($payload['url']) ? trim($payload['url']) : '';
    if ($url === '') {
        respondWithError('Please provide an ICS URL to fetch.', 422);
    }
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        respondWithError('The ICS URL provided is invalid.', 422);
    }
    $scheme = strtolower(parse_url($url, PHP_URL_SCHEME) ?: '');
    if (!in_array($scheme, ['http', 'https'], true)) {
        respondWithError('Only HTTP and HTTPS ICS links are supported.', 422);
    }

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($curl, CURLOPT_TIMEOUT, 20);
    curl_setopt($curl, CURLOPT_USERAGENT, 'CalendarWeb ICS Fetcher/1.0');

    $response = curl_exec($curl);
    if ($response === false) {
        $error = curl_error($curl);
        curl_close($curl);
        respondWithError('Unable to download ICS file: ' . $error, 500);
    }

    $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);

    if ($status < 200 || $status >= 300) {
        respondWithError('ICS link responded with ' . $status . ': ' . substr($response, 0, 300), $status);
    }

    respondWithSuccess(['content' => $response]);
}

function normalise_base_url($url) {
    $url = trim($url);
    if ($url === '') {
        return '';
    }
    if (!preg_match('#^https?://#i', $url)) {
        $url = 'https://' . $url;
    }
    if (substr($url, -1) !== '/') {
        $url .= '/';
    }
    return $url;
}

/**
 * Send success response
 */
function respondWithSuccess($data) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $data
    ]);
    exit;
}

/**
 * Send error response
 */
function respondWithError($message, $code = 400) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'error' => $message
    ]);
    exit;
}

/**
 * Generate a unique ID
 */
function generateId() {
    return uniqid('', true);
}

/**
 * Database Configuration (Example)
 * Uncomment and configure when implementing database storage
 */
/*
function getDatabaseConnection() {
    $host = 'localhost';
    $dbname = 'calendar_db';
    $username = 'root';
    $password = '';
    
    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        respondWithError('Database connection failed: ' . $e->getMessage(), 500);
    }
}
*/

/**
 * Example: Get tasks from database
 */
/*
function getTasksFromDatabase() {
    $pdo = getDatabaseConnection();
    $stmt = $pdo->query("SELECT * FROM tasks ORDER BY date, start_time");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
*/

/**
 * Example: Insert task into database
 */
/*
function insertTaskToDatabase($task) {
    $pdo = getDatabaseConnection();
    $stmt = $pdo->prepare("
        INSERT INTO tasks (name, type, date, start_time, end_time, location, description, link)
        VALUES (:name, :type, :date, :start_time, :end_time, :location, :description, :link)
    ");
    $stmt->execute($task);
    return $pdo->lastInsertId();
}
*/
?>
