from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import pandas as pd
import os
import json
import time
from datetime import datetime
import psutil
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.FileHandler("server.log"), logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='static')
CORS(app)  # Enable CORS for all routes

# Configuration
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
STORAGE_DIR = '/mnt/animation_storage'  # External drive mount point
BACKUP_DIR = '/mnt/animation_backup'  # Backup drive mount point
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')

# Create directories if they don't exist
for directory in [DATA_DIR, UPLOAD_FOLDER]:
    if not os.path.exists(directory):
        os.makedirs(directory)

# Initialize data files if they don't exist
def init_data_files():
    default_files = {
        'tasks.json': [],
        'notes.json': [],
        'milestones.json': [
            {"id": 1, "name": "Pre-Production", "completed": False, "active": True},
            {"id": 2, "name": "Production", "completed": False, "active": False},
            {"id": 3, "name": "Post-Production", "completed": False, "active": False}
        ],
        'shots.json': [],
        'concepts.json': [],
        'project_stats.json': {
            "scenes": {"total": 24, "completed": 0},
            "characters": {"total": 6, "completed": 0},
            "shots": {"total": 300, "completed": 0},
            "music": {"total": 8, "completed": 0}
        }
    }
    
    for filename, default_data in default_files.items():
        file_path = os.path.join(DATA_DIR, filename)
        if not os.path.exists(file_path):
            with open(file_path, 'w') as f:
                json.dump(default_data, f)
                logger.info(f"Created default {filename}")

init_data_files()

# Helper functions
def read_json_file(filename):
    file_path = os.path.join(DATA_DIR, filename)
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error reading {filename}: {str(e)}")
        return []

def write_json_file(filename, data):
    file_path = os.path.join(DATA_DIR, filename)
    try:
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error writing to {filename}: {str(e)}")
        return False

def get_storage_info():
    try:
        if os.path.exists(STORAGE_DIR):
            total = psutil.disk_usage(STORAGE_DIR).total
            used = psutil.disk_usage(STORAGE_DIR).used
            return {
                "total": total,
                "used": used,
                "percentage": (used / total) * 100 if total > 0 else 0
            }
        else:
            logger.warning(f"Storage directory {STORAGE_DIR} not found")
            # Return mock data if directory doesn't exist
            return {"total": 2000000000000, "used": 1200000000000, "percentage": 60}
    except Exception as e:
        logger.error(f"Error getting storage info: {str(e)}")
        return {"total": 0, "used": 0, "percentage": 0}

def get_backup_info():
    try:
        if os.path.exists(BACKUP_DIR):
            backup_files = [f for f in os.listdir(BACKUP_DIR) if os.path.isfile(os.path.join(BACKUP_DIR, f))]
            if backup_files:
                backup_times = [os.path.getmtime(os.path.join(BACKUP_DIR, f)) for f in backup_files]
                latest_backup = max(backup_times)
                return {
                    "last_backup": datetime.fromtimestamp(latest_backup).isoformat(),
                    "status": "OK"
                }
        
        # Return mock data if directory doesn't exist or no backups found
        return {"last_backup": datetime.now().isoformat(), "status": "OK"}
    except Exception as e:
        logger.error(f"Error getting backup info: {str(e)}")
        return {"last_backup": None, "status": "Error"}

# API Routes
@app.route('/api/shots/import', methods=['POST'])
def import_shots():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    # Check file extension
    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        return jsonify({"error": "Invalid file format. Please upload Excel or CSV file"}), 400
    
    try:
        # Save the file temporarily
        temp_path = os.path.join(UPLOAD_FOLDER, 'temp_' + file.filename)
        file.save(temp_path)
        
        # Read the Excel or CSV file
        if file.filename.endswith('.csv'):
            df = pd.read_csv(temp_path)
        else:
            df = pd.read_excel(temp_path)
        
        # Clean up column names (remove whitespace, make lowercase)
        df.columns = [col.strip().lower() for col in df.columns]
        
        # Map columns to our expected format
        column_mapping = {
            'id': ['id', 'shot id', 'shot', 'shot number', 'number'],
            'scene': ['scene', 'sequence', 'scene name'],
            'description': ['description', 'desc', 'shot description'],
            'status': ['status', 'shot status', 'state'],
            'notes': ['notes', 'comments', 'note']
        }
        
        # Initialize the shots list
        shots = []
        
        # Process each row
        for _, row in df.iterrows():
            shot = {}
            
            # Map each field using the column mapping
            for target_field, possible_columns in column_mapping.items():
                for col in possible_columns:
                    if col in df.columns:
                        value = row[col]
                        # Convert to string and handle NaN
                        if pd.isna(value):
                            value = ''
                        else:
                            value = str(value).strip()
                            
                        shot[target_field] = value
                        break
                
                # If field is still missing, add a default value
                if target_field not in shot:
                    if target_field == 'id':
                        shot[target_field] = str(len(shots) + 1).zfill(3)  # Default ID
                    elif target_field == 'status':
                        shot[target_field] = 'Not Started'  # Default status
                    else:
                        shot[target_field] = ''  # Default empty string
            
            shots.append(shot)
        
        # Save the processed shots to data file
        if write_json_file('shots.json', shots):
            # Remove temporary file
            os.remove(temp_path)
            return jsonify({"message": f"Successfully imported {len(shots)} shots", "shots": shots})
        else:
            return jsonify({"error": "Failed to save imported shots"}), 500
    
    except Exception as e:
        logger.error(f"Error importing shots: {str(e)}")
        return jsonify({"error": f"Error processing file: {str(e)}"}), 500
        
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = read_json_file('tasks.json')
    return jsonify(tasks)

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/api/tasks', methods=['POST'])
def add_task():
    tasks = read_json_file('tasks.json')
    new_task = request.json
    
    # Generate new ID
    new_id = 1
    if tasks:
        new_id = max(task.get('id', 0) for task in tasks) + 1
    
    new_task['id'] = new_id
    new_task['createdAt'] = datetime.now().isoformat()
    
    tasks.append(new_task)
    if write_json_file('tasks.json', tasks):
        return jsonify(new_task), 201
    return jsonify({"error": "Failed to add task"}), 500

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    tasks = read_json_file('tasks.json')
    updated_task = request.json
    
    for i, task in enumerate(tasks):
        if task.get('id') == task_id:
            # Preserve ID and createdAt
            updated_task['id'] = task_id
            if 'createdAt' in task:
                updated_task['createdAt'] = task['createdAt']
            updated_task['updatedAt'] = datetime.now().isoformat()
            
            tasks[i] = updated_task
            if write_json_file('tasks.json', tasks):
                return jsonify(updated_task)
            return jsonify({"error": "Failed to update task"}), 500
    
    return jsonify({"error": "Task not found"}), 404

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    tasks = read_json_file('tasks.json')
    task_found = False
    
    for i, task in enumerate(tasks):
        if task.get('id') == task_id:
            tasks.pop(i)
            task_found = True
            break
    
    if task_found:
        if write_json_file('tasks.json', tasks):
            return jsonify({"message": "Task deleted successfully"})
        return jsonify({"error": "Failed to delete task"}), 500
    
    return jsonify({"error": "Task not found"}), 404

@app.route('/api/images', methods=['GET'])
def get_images():
    images = read_json_file('concepts.json')
    # Make sure each image has the correct URL
    for img in images:
        img['url'] = f'/uploads/{img["filename"]}'
    return jsonify(images)

@app.route('/api/images/discover')
def discover_images():
    import glob
    concepts = []
    
    # Find all images in uploads folder
    image_files = glob.glob(os.path.join(UPLOAD_FOLDER, "*.png"))
    image_files.extend(glob.glob(os.path.join(UPLOAD_FOLDER, "*.jpg")))
    image_files.extend(glob.glob(os.path.join(UPLOAD_FOLDER, "*.jpeg")))
    
    for i, file_path in enumerate(image_files):
        filename = os.path.basename(file_path)
        concept = {
            "id": i + 1,
            "name": f"Image {i + 1}",
            "category": "Discovered",
            "filename": filename,
            "posX": 100 + (i * 50),
            "posY": 100 + (i * 50),
            "width": 300,
            "height": 200,
            "createdAt": datetime.now().isoformat()
        }
        concepts.append(concept)
    
    # Save to concepts.json
    if write_json_file('concepts.json', concepts):
        return jsonify({"message": f"Discovered {len(concepts)} images", "concepts": concepts})
    return jsonify({"error": "Failed to save discoveries"}), 500

@app.route('/api/notes', methods=['POST'])
def add_note():
    notes = read_json_file('notes.json')
    new_note = request.json
    
    # Generate new ID
    new_id = 1
    if notes:
        new_id = max(note.get('id', 0) for note in notes) + 1
    
    new_note['id'] = new_id
    new_note['createdAt'] = datetime.now().isoformat()
    
    notes.append(new_note)
    if write_json_file('notes.json', notes):
        return jsonify(new_note), 201
    return jsonify({"error": "Failed to add note"}), 500


@app.route('/api/images/<int:image_id>/position', methods=['PUT'])
def update_image_position(image_id):
    print(f"Received position update request for image {image_id}")
    print(f"Request data: {request.json}")
    images = read_json_file('concepts.json')
    position = request.json
    
    for i, img in enumerate(images):
        if img.get('id') == image_id:
            # Update the position
            images[i]['posX'] = position.get('posX', img.get('posX', 100))
            images[i]['posY'] = position.get('posY', img.get('posY', 100))
            
            if write_json_file('concepts.json', images):
                return jsonify({"message": "Position updated successfully"})
            return jsonify({"error": "Failed to update position"}), 500
    
    return jsonify({"error": "Image not found"}), 404


@app.route('/api/images/<int:image_id>/size', methods=['PUT'])
def update_image_size(image_id):
    images = read_json_file('concepts.json')
    updated_size = request.json
    
    for i, img in enumerate(images):
        if img.get('id') == image_id:
            images[i]['width'] = updated_size.get('width', img.get('width', 300))
            images[i]['height'] = updated_size.get('height', img.get('height', 200))
            
            if write_json_file('concepts.json', images):
                return jsonify({"message": "Size updated successfully"})
            return jsonify({"error": "Failed to update size"}), 500
    
    return jsonify({"error": "Image not found"}), 404

@app.route('/api/notes/<int:note_id>', methods=['PUT'])
def update_note(note_id):
    notes = read_json_file('notes.json')
    updated_note = request.json
    
    for i, note in enumerate(notes):
        if note.get('id') == note_id:
            updated_note['id'] = note_id
            notes[i] = updated_note
            
            if write_json_file('notes.json', notes):
                return jsonify(updated_note)
            return jsonify({"error": "Failed to update note"}), 500
    
    return jsonify({"error": "Note not found"}), 404

@app.route('/api/milestones', methods=['GET'])
def get_milestones():
    milestones = read_json_file('milestones.json')
    return jsonify(milestones)

@app.route('/api/milestones/<int:milestone_id>', methods=['PUT'])
def update_milestone(milestone_id):
    milestones = read_json_file('milestones.json')
    
    for i, milestone in enumerate(milestones):
        if milestone.get('id') == milestone_id:
            # Update the active state
            milestones[i]['active'] = True
            
            # Set all others to inactive
            for j, other in enumerate(milestones):
                if j != i:
                    milestones[j]['active'] = False
            
            if write_json_file('milestones.json', milestones):
                return jsonify(milestones)
            return jsonify({"error": "Failed to update milestone"}), 500
    
    return jsonify({"error": "Milestone not found"}), 404

@app.route('/api/shots', methods=['GET'])
def get_shots():
    shots = read_json_file('shots.json')
    return jsonify(shots)

@app.route('/api/shots', methods=['POST'])
def add_shot():
    shots = read_json_file('shots.json')
    new_shot = request.json
    
    # Generate new ID
    shot_id = request.json.get('id')
    if not shot_id:
        # Auto-generate ID if not provided
        ids = [shot.get('id', '000') for shot in shots]
        numeric_ids = [int(id) for id in ids if id.isdigit()]
        next_id = max(numeric_ids) + 1 if numeric_ids else 1
        new_shot['id'] = f"{next_id:03d}"
    
    shots.append(new_shot)
    if write_json_file('shots.json', shots):
        return jsonify(new_shot), 201
    return jsonify({"error": "Failed to add shot"}), 500

@app.route('/api/shots/import-alternate', methods=['POST'])  # Different route
def import_shots_alternate():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    # Here you would process the Excel file
    # For now, we'll just return a success message
    return jsonify({"message": "Import functionality not implemented yet"}), 501

@app.route('/api/concepts', methods=['GET'])
def get_concepts():
    concepts = read_json_file('concepts.json')
    return jsonify(concepts)


@app.route('/api/health')
def health_check():
    return jsonify({"status": "ok"})


@app.route('/api/concepts', methods=['POST'])
def add_concept():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    concepts = read_json_file('concepts.json')
    file = request.files['file']
    name = request.form.get('name', 'Untitled')
    category = request.form.get('category', 'Other')
    
    # Generate new ID
    new_id = 1
    if concepts:
        new_id = max(concept.get('id', 0) for concept in concepts) + 1
    
    # Save the file
    filename = f"concept_{new_id}_{int(time.time())}.{file.filename.split('.')[-1]}"
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)
    
    new_concept = {
        "id": new_id,
        "name": name,
        "category": category,
        "filename": filename,
        "createdAt": datetime.now().isoformat()
    }
    
    concepts.append(new_concept)
    if write_json_file('concepts.json', concepts):
        return jsonify(new_concept), 201
    return jsonify({"error": "Failed to add concept"}), 500

@app.route('/api/project/stats', methods=['GET'])
def get_project_stats():
    stats = read_json_file('project_stats.json')
    return jsonify(stats)

@app.route('/api/project/stats', methods=['PUT'])
def update_project_stats():
    stats = read_json_file('project_stats.json')
    updated_stats = request.json
    
    if write_json_file('project_stats.json', updated_stats):
        return jsonify(updated_stats)
    return jsonify({"error": "Failed to update project stats"}), 500

@app.route('/api/system/status', methods=['GET'])
def get_system_status():
    storage = get_storage_info()
    backup = get_backup_info()
    
    # Get render cache info (mocked for now)
    render_cache = {
        "total": 500000000000,  # 500GB
        "used": 425000000000,   # 425GB
        "percentage": 85
    }
    
    return jsonify({
        "storage": storage,
        "backup": backup,
        "render_cache": render_cache,
        "system_time": datetime.now().isoformat(),
        "uptime": int(time.time() - psutil.boot_time()),
        "cpu_usage": psutil.cpu_percent(),
        "memory_usage": dict(psutil.virtual_memory()._asdict())
    })

@app.route('/api/backup/trigger', methods=['POST'])
def trigger_backup():
    # Mock backup operation
    time.sleep(2)  # Simulate backup time
    return jsonify({"message": "Backup triggered successfully", "time": datetime.now().isoformat()})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)