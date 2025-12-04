import os
import json

def update_model_dict():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    models_dir = os.path.join(base_dir, "live2d-models")
    model_dict_path = os.path.join(base_dir, "model_dict.json")
    
    # Load existing model_dict
    if os.path.exists(model_dict_path):
        with open(model_dict_path, "r") as f:
            model_dict = json.load(f)
    else:
        model_dict = []
        
    existing_names = {m["name"] for m in model_dict}
    
    # Scan for new models
    for root, dirs, files in os.walk(models_dir):
        for file in files:
            if file.endswith(".model3.json"):
                # Found a model file
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, base_dir)
                
                # Determine model name from the directory name in live2d-models
                # Path structure: .../live2d-models/{model_name}/...
                rel_parts = os.path.relpath(full_path, models_dir).split(os.sep)
                if len(rel_parts) > 0:
                    model_name = rel_parts[0]
                    
                    if model_name not in existing_names:
                        print(f"Found new model: {model_name}")
                        new_entry = {
                            "name": model_name,
                            "description": f"Auto-detected model: {model_name}",
                            "url": "/" + rel_path, # Ensure it starts with /
                            "kScale": 0.5,
                            "initialXshift": 0,
                            "initialYshift": 0,
                            "kXOffset": 1150,
                            "idleMotionGroupName": "Idle",
                            "emotionMap": {}
                        }
                        model_dict.append(new_entry)
                        existing_names.add(model_name)

    # Save updated model_dict
    with open(model_dict_path, "w") as f:
        json.dump(model_dict, f, indent=4)
        
    print(f"Updated model_dict.json with {len(model_dict)} models.")

if __name__ == "__main__":
    update_model_dict()
