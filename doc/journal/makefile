
all:
	pandoc -s paper.md --filter pandoc-fignos --filter pandoc-tablenos --default-image-extension=pdf --bibliography=paperlib.bib --csl apa.csl -o paper.pdf
	pandoc -s paper.md --filter pandoc-fignos --filter pandoc-tablenos --default-image-extension=png --bibliography=paperlib.bib --csl apa.csl -o paper.docx
