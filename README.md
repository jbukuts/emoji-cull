# emoji-cull ✂
Project to parse and cull unneeded glyphs from an emoji font file

## What is this? 🤔

This is a project written in Node with the purpose of removing all the unwanted / uneed glyphs from an emoji file. 

Originally I had tried to use fontkit but it was unable to read my input file but it had trouble reading the glyphs. It should be noted I've only focused on font files encoded with the [OpenType spec](https://learn.microsoft.com/en-us/typography/opentype/spec/otff) and even then I haven't covered all possible encodining options for each of the tables present. 

Original binary reader implemention from [tchayen](https://tchayen.github.io/posts/ttf-file-parsing)
