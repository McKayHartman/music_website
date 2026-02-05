import fitz

pdf = fitz.open("sample.pdf")

page = pdf[0]
pix = page.get_pixmap()
pix.save("first_page.png")