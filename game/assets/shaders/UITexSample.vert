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

uniform mat3 UITransform;
uniform mat4 Ortho;
out vec2 TexCoords;

void main()
{
    TexCoords = aTexCoords; 
    vec3 affinePos = vec3(aPos.x, aPos.y, 1);
    vec3 transformedPos = UITransform * affinePos;
    gl_Position = Ortho * vec4(transformedPos.x, transformedPos.y, 1.0, 1.0); 
}
