from PIL import Image
import os

def remove_background(input_path, output_path):
    print(f"Processing {input_path}...")
    try:
        img = Image.open(input_path)
        img = img.convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            # Change all white (also shades of whites)
            # Find all pixels that are white or very close to white
            if item[0] > 200 and item[1] > 200 and item[2] > 200:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)

        img.putdata(newData)
        img.save(output_path, "PNG")
        print(f"Saved processed signature to {output_path}")
    except Exception as e:
        print(f"Error processing image: {e}")

input_img = r"C:/Users/ediso/.gemini/antigravity/brain/ffad89ca-9772-4c97-a72e-ddb173782dba/uploaded_image_1767894817663.png"
output_img = r"c:\Users\ediso\OneDrive\Documents\coding\project-Concept\assets\signature.png"

remove_background(input_img, output_img)
