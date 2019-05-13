/**
* @file EntityPtrBuffer.vert
* @author Harry Humphries
* @date 7/30/2018
* @brief Build buffer for geometry
* @details
* @par Project Abyss
* @par Copyright(C) 2018 DigiPen Institute of Technology
*/
#version 430 core

layout (location = 0) in vec3 aPos;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{ 
    gl_Position = projection * view * model * vec4(aPos, 1.0);
}



