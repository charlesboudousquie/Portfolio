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

uniform sampler2D texture_diffuse1;
uniform sampler2D texture_diffuse2;
uniform sampler2D texture_diffuse3;
uniform sampler2D texture_diffuse4;
uniform sampler2D texture_diffuse5;



void main()
{    
    FragColor = color / 3.0f;
    //FragColor = texture(texture_diffuse1, TexCoords); 
}

