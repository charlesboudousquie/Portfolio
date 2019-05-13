/**
* @file PBR.vert
* @author Charles Boudousquie
* @date 10/08/2018
* @breif This file has functionality for PBR shading
* @details
* @par Project Abyss
* @par Copyright(C) 2018 DigiPen Institute of Technology
*/
#version 430 core

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoords;
layout (location = 3) in vec3 aTangent;
layout (location = 4) in vec3 aBitangent;  

uniform vec3 camPos;

out VS_OUT
{
    vec3 WorldPos; 
    vec2 TexCoords;
    mat3 TBN;    
    vec3 TangentViewPos;
    vec3 TangentFragPos;
} vs_out;

void main()
{
    vs_out.TexCoords = aTexCoords;   
    vec4 affineWorldPos = model * vec4(aPos, 1.0);
    vs_out.WorldPos = affineWorldPos.xyz;
    
    //matrix to bring normal back to world pos from normal map
    vec3 T = normalize(vec3(model * vec4(aTangent,   0.0)));
    vec3 B = normalize(vec3(model * vec4(aBitangent, 0.0)));
    vec3 N = normalize(vec3(model * vec4(aNormal,    0.0)));
    vs_out.TBN = mat3(T, B, N);
    mat3 toTBN = transpose(vs_out.TBN);   
    vs_out.TangentViewPos = toTBN * camPos;
    vs_out.TangentFragPos = toTBN * vs_out.WorldPos;   
    
    gl_Position = projection * view * affineWorldPos;
}
