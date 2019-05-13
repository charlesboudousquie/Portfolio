/**
* @file DeferredPointLight.frag
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

layout (std140, binding = 3) uniform SpotLight
{
    vec4  Position;
    vec4  Direction;
    vec4  Ambient;
    vec4  Color;

    float InnerAngle;
    float OuterAngle;
    float FallOff;
    float PADDING;
} SL;

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

//uniform unsigned int i_light; 
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
    vec3  worldPos  = texture(positionMap, TexCoords).rgb;
    vec3  N         = texture(normalMap, TexCoords).rgb;
    vec3 albedo    = texture(albedoMap, TexCoords).rgb;
    float metallic  = texture(metallicMap, TexCoords).r;
    float roughness = texture(roughnessMap, TexCoords).r;
    float ao        = texture(aoMap, TexCoords).r;

    vec3 V = normalize(camPos - worldPos);

    vec3 F0 = vec3(0.04); 
    F0 = mix(F0, albedo, metallic);
	           
    vec3 L = SL.Direction.xyz;
    vec3 D = normalize(SL.Position.xyz - worldPos.xyz);
    float L_dot_D = clamp(dot(L,D), 0.0f, 1.0f);
    float cosPhi = cos(SL.OuterAngle);
    float cosTheta = cos(SL.InnerAngle);    
    
    float distance    = length(SL.Position.xyz  - worldPos)* (1.0f / SL.Color.a);
    // Ambient
    float pointAtten =
    1.0 / (PBR.Atten.x + PBR.Atten.y * distance + PBR.Atten.z * distance * distance);
    
    if (L_dot_D < cosPhi) 
    {
        discard;
    }

    float spotAtten = 1;
    if (L_dot_D <= cosTheta)
    {
        spotAtten = pow((L_dot_D - cosPhi) / (cosTheta - cosPhi), SL.FallOff);
    }

    vec3 radiance     = SL.Color.xyz * pointAtten * spotAtten;        
    vec3 H = normalize(V + L);
    // cook-torrance brdf - an approx of sub surface scattering to figure out specular contrib
    float NDF = DistributionGGX(N, H, roughness);        
    float G   = GeometrySmith(N, V, L, roughness);      
    vec3 F    = fresnelSchlick(max(dot(H, V), 0.0), F0);       
    
    vec3 kS = F;
    vec3 kD = vec3(1.0) - kS;
    kD *= 1.0 - metallic;	  
    
    vec3 numerator    = NDF * G * F;
    float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0);
    vec3 specular     = numerator / max(denominator, 0.001); 
            
    vec3 Lo = (kD * albedo / PI + specular) * radiance; 
   
    FragColor = vec4(Lo, 1);
}

