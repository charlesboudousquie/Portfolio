/**
* @file FSQ.frag
* @author Harry Humphries
* @date 10/20/2018
* @breif This file has functionality for default shading.
* @details
* @par Project Abyss
* @par Copyright(C) 2018 DigiPen Institute of Technology
*/
#version 430 core

out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D UITexture;
uniform vec4 Color;

void main()
{   
    vec2 correctedCoords = vec2(TexCoords.x, 1 - TexCoords.y);
    FragColor = vec4(texture(UITexture, correctedCoords).rgba) * Color;
}

