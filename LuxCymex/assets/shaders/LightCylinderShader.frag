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
uniform vec2  u_RadHeight;
uniform float u_fov;
uniform float u_time;
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

float skewedRaysDist(vec3 start1, vec3 dir1, vec3 start2, vec3 dir2, float length2, inout vec3 p2)
{
    // Returns distance between and inifinite long ray
    // starting at start1 with direction dir1,
    // and a line starting at start2 with direction dir2, and length length2
   
	vec3 n = normalize(cross(dir1, dir2));
	vec3 n1 = normalize(cross(n,dir1));
	vec3 n2 = normalize(cross(n,dir2));
    
    // t position along ray1
	float t1 = dot(start2-start1,n2)/dot(dir1,n2);
    t1 = max(0.0, t1);
    
    // t position along ray2
	float t2 = dot(start1-start2,n1)/dot(dir2,n1);
    // clamp t2
    t2 = clamp(t2,0.0,length2);
    
    // Length between the two positions
    vec3 p1 = start1 + dir1 * t1;
    p2 = start2 + dir2 * t2;
    return length(p1-p2);
}

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main()
{
    vec2 vertPos = (TexCoords - 0.5) * 2.0;
    vec4 texCol = texture2D( u_colorAttachment0, TexCoords);
    
    vec3 vLightPos  = (inverseView * vec4(SL.Position.xyz,1)).xyz;
    vec3 vLightDir  = (inverseView * vec4(normalize( -SL.Direction.xyz),0)).xyz;

    float tanFOV    = tan(u_fov*0.5);
    vec3  nearPos   = vec3( vertPos.x * u_vp.x/u_vp.y * tanFOV, vertPos.y * tanFOV, -1.0 );
    //vec2 texCoord = gl_FragCoord.xy / u_vp;
    //vec3 nearPos  = vec3( (texCoord.x-0.5) * u_vp.x/u_vp.y, texCoord.y-0.5, -u_depthRange.x );
    vec3 los        = normalize( nearPos );
    
    // ray definition
    vec3 O = vec3(0.0);
    vec3 D = los;

    // cone definition
    vec3  C     = vLightPos.xyz;
    vec3  V     = vLightDir.xyz;  

    //distance between camera ray and light direction
    vec3 p2 = vec3(0);
    float height = u_RadHeight.y;
    float hHeight = 0.5f * height;
    float skewDist = skewedRaysDist(O, D, C - hHeight * V, V, height, p2);
    float radius = u_RadHeight.x * 0.5f;
    //prettyify ray and give brighter inner radius
	  float g = 0;
    if (skewDist > radius)
    {
      g = 1 - smoothstep(radius, radius + 0.2f, skewDist); 
    }
    else
    {
      g = smoothstep(radius - 1.0f, radius, skewDist); 
    }
    
    g = pow(g,1);
    vec3 col = SL.Color.rgb*g*0.2;
    
    //soft outer radius]
    g = 1 - pow(smoothstep(0.0, radius, skewDist),0.7);
    col += SL.Color.rgb * g * 0.425;     
    
    
    FragColor = vec4(col, 1);
}