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
