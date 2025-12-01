import os
import yaml

def generate_configs():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    models_dir = os.path.join(base_dir, "live2d-models")
    characters_dir = os.path.join(base_dir, "characters")
    
    if not os.path.exists(characters_dir):
        os.makedirs(characters_dir)
        
    # Get all subdirectories in live2d-models
    models = [d for d in os.listdir(models_dir) if os.path.isdir(os.path.join(models_dir, d))]
    
    print(f"Found {len(models)} models.")
    
    for model_name in models:
        config_path = os.path.join(characters_dir, f"{model_name}.yaml")
        
        config_data = {
            "character_config": {
                "live2d_model_name": model_name
            }
        }
        
        with open(config_path, "w") as f:
            yaml.dump(config_data, f, default_flow_style=False)
            
        print(f"Generated config for {model_name}: {config_path}")

if __name__ == "__main__":
    generate_configs()
