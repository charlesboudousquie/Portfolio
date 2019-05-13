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

layout (std140, binding = 1) uniform PointLightArray
{
    PointLight PL[PL_MAX_SIZE];
} PLA;

layout (std140, binding = 2) uniform DirectionalLightArray
{
   DirectionalLight DL[DL_MAX_SIZE];   
} DLA;

layout (std140, binding = 3) uniform SpotLightArray
{
   SpotLight SL[SL_MAX_SIZE];
} SLA;

out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D positionMap;
uniform sampler2D normalMap;
uniform sampler2D albedoMap;
uniform sampler2D metallicMap;
uniform sampler2D roughnessMap;
uniform sampler2D aoMap;
uniform sampler2D emissiveMap;
  
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
	           
    // reflectance equation
    vec3 Lo = vec3(0.0);
    vec3 ambientAccum = PBR.GlobalAmbient.rgb;
    for(int i = 0; i < PBR.PointLightCount; ++i) 
    {
        // calculate per-light radiance
        vec3 L = normalize(PLA.PL[i].Position.xyz - worldPos);
        vec3 H = normalize(V + L);
        float distance    = length(PLA.PL[i].Position.xyz  - worldPos) * (1.0f / PLA.PL[i].Color.a);
        float attenuation = 1.0 / 
          (PBR.Atten.x + PBR.Atten.y * distance + PBR.Atten.z * distance * distance);
        vec3 radiance     = PLA.PL[i].Color.xyz * attenuation;        
        
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
            
        // add to outgoing radiance Lo
        float NdotL = max(dot(N, L), 0.0);                
        Lo += (kD * albedo / PI + specular) * radiance * NdotL; 
        ambientAccum += DLA.DL[i].Ambient.rgb;
    }   
    for(int i = 0; i < PBR.DirectionalLightCount; ++i) 
    {
        // calculate per-light radiance
        vec3 L = normalize(-DLA.DL[i].Direction.xyz);
        vec3 H = normalize(V + L);
        vec3 radiance     = DLA.DL[i].Color.xyz;
        
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
            
        // add to outgoing radiance Lo
        float NdotL = max(dot(N, L), 0.0);                
        Lo += (kD * albedo / PI + specular) * radiance * NdotL; 
    } 
    for( int i = 0; i < PBR.SpotLightCount; ++i )
    {
        vec3 L = SLA.SL[i].Direction.xyz;
        vec3 D = normalize(SLA.SL[i].Position.xyz - worldPos.xyz);
        float L_dot_D = dot(L,D);
        float cosPhi = cos(SLA.SL[i].OuterAngle);
        float cosTheta = cos(SLA.SL[i].InnerAngle);    
        
        float distance    = length(SLA.SL[i].Position.xyz  - worldPos)* (1.0f / SLA.SL[i].Color.a);
        // Ambient
        float pointAtten =
        1.0 / (PBR.Atten.x + PBR.Atten.y * distance + PBR.Atten.z * distance * distance);
        
        if (L_dot_D < cosPhi) 
        {
            continue;
        }

        float spotAtten = 1;
        if (L_dot_D <= cosTheta)
        {
            spotAtten = pow((L_dot_D - cosPhi) / (cosTheta - cosPhi), SLA.SL[i].FallOff);
        }

        vec3 radiance     = SLA.SL[i].Color.xyz * pointAtten * spotAtten;        
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
                
        Lo += (kD * albedo / PI + specular) * radiance; 
        ambientAccum += SLA.SL[i].Ambient.rgb;        
    }
    // apply global ambient based on ambient occlusion and albedo
    vec3 ambient = ambientAccum * albedo * ao;
    vec3 color = ambient + Lo;
	  
    //global fog attenuation
    float v_len = length(camPos - worldPos);
    float s = (PBR.farP - v_len) / (PBR.farP - PBR.nearP);
    color = s * color + (1 - s) * PBR.GlobalFog.rgb;

    //TODO Move HDR Tone mapping to post processing 
    color = color / (color + vec3(1.0));

    //TODO Move Gamma correction to post processing
    color = pow(color, vec3(1.0/2.2));  
   
    FragColor = vec4(color, 1);
}

