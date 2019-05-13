/**
* @file LightConeShader.frag
* @author Harry Humphries
* @date 10/20/2018
* @breif This file has functionality for default shading.
* @details
* @par Project Abyss
* @par Copyright(C) 2018 DigiPen Institute of Technology
*/
#version 430 core

in vec2 TexCoords;
out vec4 FragColor;
uniform mat4 inverseView;
uniform sampler2D u_colorAttachment0;
uniform vec2  u_depthRange;
uniform vec2  u_vp;
uniform float u_fov;
uniform float u_radius;

layout (std140, binding = 1) uniform PointLight
{
    vec4 Position;
    vec4 Ambient;
    vec4 Color;
} PL;

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

float rayPointDist(vec3 start1, vec3 dir1, vec3 point)
{
    // Returns distance between and inifinite long ray
    // starting at start1 with direction dir1,
    // and a point
  return length(cross(dir1, point - start1));
}

void main()
{
    vec2 vertPos = (TexCoords - 0.5) * 2.0;
    vec4 texCol = texture2D( u_colorAttachment0, TexCoords);
    
    vec3 vLightPos  = (inverseView * vec4(PL.Position.xyz,1)).xyz;

    float tanFOV    = tan(u_fov*0.5);
    vec3  nearPos   = vec3( vertPos.x * u_vp.x/u_vp.y * tanFOV, vertPos.y * tanFOV, -1.0 );
    vec3 los        = normalize( nearPos );
    
    // ray definition
    vec3 O = vec3(0.0);
    vec3 D = los;

    // cone definition
    vec3  C     = vLightPos.xyz; 

    //distance between camera ray and light direction
    float rpDist = rayPointDist(O, D, C);
    
	  float g = 0;
    if (rpDist > u_radius)
    {
      g = 1 - smoothstep(u_radius, u_radius + 0.2f, rpDist); 
    }
    else
    {
      g = smoothstep(u_radius - 1.0f, u_radius, rpDist); 
    }  
    
    g = pow(g,1);
    vec3 col = PL.Color.rgb*g*0.2;
    
    //soft outer radius
    g = 1 - pow(smoothstep(0.0, u_radius, rpDist),0.7);
    col += PL.Color.rgb * g * 0.225;
    
    FragColor = vec4(col, 1);
}