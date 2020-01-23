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

struct PointLight
{
    vec4 Position;
    vec4 Ambient;
    vec4 Color;
};

struct DirectionalLight
{
    vec4 Direction;
    vec4 Ambient;
    vec4 Color; 
};

struct SpotLight
{
    vec4  Position;
    vec4  Direction;
    vec4  Ambient;
    vec4  Color;

    float InnerAngle;
    float OuterAngle;
    float FallOff;
    float PADDING;
};

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

//layout (std140, binding = 1) uniform PointLightArray
//{
//    PointLight PL[PL_MAX_SIZE];
//} PLA;
//
//layout (std140, binding = 2) uniform DirectionalLightArray
//{
//   DirectionalLight DL[DL_MAX_SIZE];   
//} DLA;
//
//layout (std140, binding = 3) uniform SpotLightArray
//{
//   SpotLight SL[SL_MAX_SIZE];
//} SLA;

out vec4 FragColor;

in vec2 TexCoords;

layout(binding = 0) uniform sampler2D positionMap;
layout(binding = 1) uniform sampler2D normalMap;
layout(binding = 2) uniform sampler2D albedoMap;
layout(binding = 3) uniform sampler2D metallicMap;
layout(binding = 4) uniform sampler2D roughnessMap;
layout(binding = 5) uniform sampler2D aoMap;
layout(binding = 6) uniform sampler2D emissiveMap;
  
uniform vec3 camPos;

//approximation of alignment of microfacets with halfway vector (specular)
float DistributionGGX(vec3 N, vec3 H, float roughness)
{
    float a      = roughness*roughness;
    float a2     = a*a;
    float NdotH  = max(dot(N, H), 0.0);
    float NdotH2 = NdotH*NdotH;
	
    float num   = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;
	
    return num / denom;
}

// approximates what percent of surface microfacets will receive light (diffuse)
float GeometrySchlickGGX(float NdotV, float roughness)
{
    float r = (roughness + 1.0);
    float k = (r*r) / 8.0;

    float num   = NdotV;
    float denom = NdotV * (1.0 - k) + k;
	
    return num / denom;
}

//combine prev 2 fns for final approximation
float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness)
{
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2  = GeometrySchlickGGX(NdotV, roughness);
    float ggx1  = GeometrySchlickGGX(NdotL, roughness);
	
    return ggx1 * ggx2;
}

vec3 fresnelSchlick(float cosTheta, vec3 F0)
{
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

void main()
{
    //TODO Move HDR Tone mapping to post processing 
    color = color / (color + vec3(1.0));

    //TODO Move Gamma correction to post processing
    color = pow(color, vec3(1.0/2.2));  
   
    FragColor = vec4(color, 1);
}

