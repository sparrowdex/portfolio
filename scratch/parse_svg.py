import xml.etree.ElementTree as ET

tree = ET.parse('d:/Portfolio/public/images/flower.svg')
root = tree.getroot()

print("SVG tag:", root.tag)
print("SVG attributes:", root.attrib)

def print_element(elem, depth=0):
    indent = "  " * depth
    # print element tag, id, and attributes, but omit long base64 string attributes
    attrs = {k: (v[:50] + "...") if len(v) > 50 else v for k, v in elem.attrib.items()}
    print(f"{indent}<{elem.tag.split('}')[-1]} id={elem.get('id')} attrs={attrs}>")
    for child in elem:
        print_element(child, depth + 1)

print_element(root)
