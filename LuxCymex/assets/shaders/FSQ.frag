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

uniform sampler2D screenTexture;

float near = 0.1; 
float far  = 200.0; 
  
float LinearizeDepth(float depth) 
{
    float z = depth * 2.0 - 1.0; // back to NDC 
    return (2.0 * near * far) / (far + near - z * (far - near));	
}
void main()
{    
    //float depth = LinearizeDepth(texture(screenTexture, TexCoords).r) / far;
    //FragColor = vec4(depth, depth, depth, 1.0);
    FragColor = vec4(texture(screenTexture, TexCoords).rgb, 1);
}

