/**
* @file Default.frag
* @author Charles Boudousquie
* @date 7/30/2018
* @breif This file has functionality for default shading.
* @details
* @par Project Abyss
* @par Copyright(C) 2018 DigiPen Institute of Technology
*/
#version 430 core

out vec4 FragColor;

in vec2 TexCoords;

uniform vec4 color;

void main()
{    
    FragColor = color;
    //FragColor = texture(texture_diffuse1, TexCoords);
}

