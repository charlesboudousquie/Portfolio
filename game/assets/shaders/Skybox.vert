/**
* @file Skybox.vert
* @author Charles Boudousquie
* @date 8/16/2018
* @breif This shader displays the skybox of the entire scene.
* @details 
* @par Project Abyss
* @par Copyright(C) 2018 DigiPen Institute of Technology
*/
#version 430 core

layout (location = 0) in vec3 aPos;

out vec3 TexCoords;

uniform mat4 view; // This matrix holds the model-to-view transform
//uniform mat4 model;       // this matrix is the model matrix
uniform mat4 projection;

void main()
{
    TexCoords = aPos;
    vec4 viewPos = view * vec4(aPos, 1.0);
    vec4 pos = projection * viewPos;
    pos.z = pos.w - 0.000001;
    gl_Position = pos.xyzw;
} 