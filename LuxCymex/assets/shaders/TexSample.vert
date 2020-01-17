/**
* @file Default.vert
* @author Charles Boudousquie
* @date 7/30/2018
* @breif This file has functionality for default shading.
* @details
* @par Project Abyss
* @par Copyright(C) 2018 DigiPen Institute of Technology
*/
#version 430 core

layout (location = 0) in vec2 aPos;
layout (location = 1) in vec2 aTexCoords;

out vec2 TexCoords;

void main()
{
    TexCoords = aTexCoords; 
    gl_Position = vec4(aPos.x, aPos.y, 0.0, 1.0); 
}



