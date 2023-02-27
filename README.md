# emoji-cull ✂
Project to parse and cull unneeded glyphs from an emoji font file

## What is this? 🤔

This is a project written in Node with the purpose of removing all the unwanted / uneeded glyphs from an emoji file to reduce it's size. 

Originally I had tried to use fontkit but it was unable to read certain glyphs from my file. It should be noted I've only focused on font files encoded with the [OpenType spec](https://learn.microsoft.com/en-us/typography/opentype/spec/otff) and even then I haven't covered all possible encoding options for each of the tables present. 

Original binary reader implemention from [tchayen](https://tchayen.github.io/posts/ttf-file-parsing)
