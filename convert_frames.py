import os
import sys
import re
import time
from PIL import Image
from concurrent.futures import ProcessPoolExecutor

def natural_sort_key(s):
    return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', s)]

def get_sorted_files(folder):
    files = [f for f in os.listdir(folder) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    files.sort(key=natural_sort_key)
    return [os.path.join(folder, f) for f in files]

def process_single_frame(args):
    src_path, dest_desktop, dest_mobile = args
    try:
        with Image.open(src_path) as im:
            orig_w, orig_h = im.size
            # Desktop 1600px, quality 78
            h1600 = int(round(1600 * orig_h / orig_w))
            im_desktop = im.resize((1600, h1600), Image.Resampling.LANCZOS)
            im_desktop.save(dest_desktop, 'WEBP', quality=78, method=4)
            
            # Mobile 960px, quality 72
            h960 = int(round(960 * orig_h / orig_w))
            im_mobile = im.resize((960, h960), Image.Resampling.LANCZOS)
            im_mobile.save(dest_mobile, 'WEBP', quality=72, method=4)
        return True
    except Exception as e:
        print(f"Error processing {src_path}: {e}", file=sys.stderr)
        return False

def main():
    t0 = time.time()
    
    # 1. Collect hero frames
    c1 = get_sorted_files('clip1 frame')
    c2 = get_sorted_files('clip2 frame')
    c3 = get_sorted_files('clip3 frame')
    
    hero_sources = list(c1)
    hero_sources.extend(c2)
    hero_sources.extend(c3)
        
    dismantle_sources = get_sorted_files('flow frames')
    
    print(f"Total Hero frames to convert: {len(hero_sources)}")
    print(f"Total Dismantle frames to convert: {len(dismantle_sources)}")
    
    for d in ['assets/frames/hero', 'assets/frames/hero-mobile', 'assets/frames/dismantle', 'assets/frames/dismantle-mobile', 'assets/cars']:
        os.makedirs(d, exist_ok=True)
        
    tasks = []
    # Hero tasks
    for i, src in enumerate(hero_sources, start=1):
        num_str = f"{i:04d}"
        dest_d = os.path.join('assets/frames/hero', f'frame_{num_str}.webp')
        dest_m = os.path.join('assets/frames/hero-mobile', f'frame_{num_str}.webp')
        tasks.append((src, dest_d, dest_m))
        
    # Dismantle tasks
    for i, src in enumerate(dismantle_sources, start=1):
        num_str = f"{i:04d}"
        dest_d = os.path.join('assets/frames/dismantle', f'frame_{num_str}.webp')
        dest_m = os.path.join('assets/frames/dismantle-mobile', f'frame_{num_str}.webp')
        tasks.append((src, dest_d, dest_m))
        
    print(f"Starting conversion of {len(tasks)} frame pairs with ProcessPoolExecutor...")
    cpu_count = os.cpu_count() or 4
    workers = min(cpu_count, 12)
    print(f"Using {workers} worker processes")
    
    with ProcessPoolExecutor(max_workers=workers) as executor:
        results = list(executor.map(process_single_frame, tasks))
        
    t1 = time.time()
    print(f"Finished {len(results)} frames in {t1 - t0:.2f} seconds.")
    
    stats = {}
    for folder in ['assets/frames/hero', 'assets/frames/hero-mobile', 'assets/frames/dismantle', 'assets/frames/dismantle-mobile']:
        files = os.listdir(folder)
        total_bytes = sum(os.path.getsize(os.path.join(folder, f)) for f in files)
        stats[folder] = (len(files), total_bytes)
        print(f"{folder}: {len(files)} files, {total_bytes / (1024*1024):.2f} MB ({total_bytes} bytes)")

if __name__ == '__main__':
    main()

