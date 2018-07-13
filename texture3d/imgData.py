from PIL import Image
im = Image.open('../resource/z-1000.jpg')
print(im.bits)
print(im.size)
print(im.mode)
print(im.format)
imdata = list(im.getdata())
print(len(imdata))
#print(imdata)
