/**
* @file DeferredLighting.frag
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

layout(binding = 0) uniform sampler2D positionMap;
layout(binding = 1) uniform sampler2D normalMap;
layout(binding = 2) uniform sampler2D albedoMap;
layout(binding = 3) uniform sampler2D metallicMap;
layout(binding = 4) uniform sampler2D roughnessMap;
layout(binding = 5) uniform sampler2D aoMap;
layout(binding = 6) uniform sampler2D emissiveMap;

uniform vec3 ambientAccum;
uniform vec3 camPos;

void main()
{
    vec3 albedo     = texture(albedoMap, TexCoords).rgb;
    float ao        = texture(aoMap, TexCoords).r;
    
    // apply global ambient based on ambient occlusion and albedo
    vec3 ambient = 0.8f * ambientAccum * albedo * ao + 0.2f * ambientAccum * ao;
    vec3 color = ambient; 
   
    FragColor = vec4(color, 1.0);
}

