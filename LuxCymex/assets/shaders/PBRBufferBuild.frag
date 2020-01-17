/**
* @file PBRBufferBuild.frag
* @author Harry Humphries
* @date 10/08/2018
* @brief Physically based rendering shader that takes maps for different lighting and material info
* @details
* @par Project Abyss
* @par Copyright(C) 2018 DigiPen Institute of Technology
*/
#version 430 core


layout (location = 0) out vec3 gPosition;
layout (location = 1) out vec3 gNormal;
layout (location = 2) out vec3 gAlbedo;
layout (location = 3) out vec3 gMetallic;
layout (location = 4) out vec3 gRoughness;
layout (location = 5) out vec3 gAo;
layout (location = 6) out vec3 gEmissive;

uniform sampler2D albedo;
uniform sampler2D normal;
uniform sampler2D height;
uniform sampler2D metallic;
uniform sampler2D roughness;
uniform sampler2D ao;

uniform vec3 camPos;

const float PI = 3.14159265359;
const float height_scale = 0.002f; //TODO fix this shit

in VS_OUT
{
    vec3 WorldPos; 
    vec2 TexCoords;
    mat3 TBN;
    vec3 TangentViewPos;
    vec3 TangentFragPos;
} fs_in;

vec2 ParallaxMapping(vec2 texCoords, vec3 viewDir)
{ 
    // number of depth layers
    const float numLayers = 30;
    // calculate the size of each layer
    float layerDepth = 1.0 / numLayers;
    // depth of current layers
    float currentLayerDepth = 0.0;
    // the amount to shift the texture coordinates per layer (from vector P)
    vec2 P = viewDir.xy / viewDir.z * height_scale; 
    vec2 deltaTexCoords = P / numLayers;
    
    vec2  currentTexCoords     = texCoords;
    float currentDepthMapValue = texture(height, currentTexCoords).r;
      
    while(currentLayerDepth < currentDepthMapValue)
    {
        // shift texture coordinates along direction of P
        currentTexCoords -= deltaTexCoords;
        // get depthmap value at current texture coordinates
        currentDepthMapValue = texture(height, currentTexCoords).r;  
        // get depth of next layer
        currentLayerDepth += layerDepth;  
    }

      // get texture coordinates before collision (reverse operations)
    vec2 prevTexCoords = currentTexCoords + deltaTexCoords;

      // get depth after and before collision for linear interpolation
    float afterDepth  = currentDepthMapValue - currentLayerDepth;
    float beforeDepth = (texture(height, prevTexCoords).r) - currentLayerDepth + layerDepth;
     
      // interpolation of texture coordinates
    float weight = afterDepth / (afterDepth - beforeDepth);
    vec2 finalTexCoords = prevTexCoords * weight + currentTexCoords * (1.0 - weight);

    return finalTexCoords;  
} 

void main()
{
// heightMap
    vec3 viewDir = normalize(fs_in.TangentViewPos - fs_in.TangentFragPos);
    vec2 texCoords = ParallaxMapping(fs_in.TexCoords,  viewDir);
    //if(texCoords.x > 1.0 || texCoords.y > 1.0 || texCoords.x < 0.0 || texCoords.y < 0.0)
    //{  
    //    discard;
    //}
    vec3 albedoCol = pow(texture(albedo, texCoords).rgb, vec3(2.2) );
    //vec3 albedo = texture(albedo, texCoords).rgb;
    //calculate world space normal
    vec3 N  = texture(normal, texCoords).rgb;
    N  = normalize(N * 2.0 - 1.0);   
    N  = normalize(fs_in.TBN * N); 

    gAlbedo    = albedoCol;
    gMetallic  = texture(metallic, texCoords).rgb;
    gRoughness = texture(roughness, texCoords).rgb;
    gAo        = texture(ao, texCoords).rgb;
    gNormal    = N;
    gPosition  = fs_in.WorldPos;
    gEmissive  = vec3(0);
}