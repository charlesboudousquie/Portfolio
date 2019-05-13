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

uniform sampler2D texture;

void main()
{    
    FragColor = vec4(texture(texture, TexCoords).rgb, 1);
}

