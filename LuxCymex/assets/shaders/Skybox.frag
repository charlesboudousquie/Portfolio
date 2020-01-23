/**
* @file Skybox.frag
* @author Charles Boudousquie
* @date 8/16/2018
* @breif This shader displays the skybox of the entire scene.
* @details 
* @par Project Abyss
* @par Copyright(C) 2018 DigiPen Institute of Technology
*/
#version 430 core

out vec4 FragColor;

in vec3 TexCoords;

uniform samplerCube skybox;

void main()
{      
  FragColor = texture(skybox, TexCoords);
}

