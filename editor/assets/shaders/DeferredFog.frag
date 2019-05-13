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

const int PL_MAX_SIZE = 16;
const int DL_MAX_SIZE = 16;
const int SL_MAX_SIZE = 16;

const float PI = 3.14159265359;

layout (std140, binding = 0) uniform GlobalPBRUniform
{
    vec4  GlobalAmbient;    
    vec4  GlobalFog;
    vec4  Atten; // {c1, c2, c3}

    uint PointLightCount;
    uint DirectionalLightCount;    
    uint SpotLightCount;
    uint PADDING1;
    
    float nearP;
    float farP;
    float DUMMY1;
    float DUMMY2;
} PBR;

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
    vec3 worldPos = texture(positionMap, TexCoords).rgb;
    vec3 albedo    = texture(albedoMap, TexCoords).rgb;   
    float ao        = texture(aoMap, TexCoords).r;
	  
    //global fog attenuation
    float v_len = length(camPos - worldPos);
    float s = (PBR.farP - v_len) / (PBR.farP - PBR.nearP);
    vec3 color = PBR.GlobalFog.rgb;
   
    FragColor = vec4(color, s);
}

