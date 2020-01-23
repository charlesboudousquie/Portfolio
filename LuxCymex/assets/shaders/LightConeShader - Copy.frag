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
    float cosTh = cos( SL.OuterAngle);
    
    // ray - cone intersection
    vec3  CO     = O - C;
    float DdotV  = dot( D, V );
    float COdotV = dot( CO, V );
    float a      = DdotV*DdotV - cosTh*cosTh;
    float b      = 2.0 * (DdotV*COdotV - dot( D, CO )*cosTh*cosTh);
    float c      = COdotV*COdotV - dot( CO, CO )*cosTh*cosTh;
    float det    = b*b - 4.0*a*c;
    
    // find intersection
    float isIsect = 0.0;
    vec3  isectP  = vec3(0.0);
    if ( det >= 0.0 )
    {
        vec3  P1 = O + (-b-sqrt(det))/(2.0*a) * D;
        vec3  P2 = O + (-b+sqrt(det))/(2.0*a) * D;
        float isect1 = step( 0.0, dot(normalize(P1-C), V) );
        float isect2 = step( 0.0, dot(normalize(P2-C), V) );
        if ( isect1 < 0.5 )
        {
            P1 = P2;
            isect1 = isect2;
        }
        if ( isect2 < 0.5 )
        {
            P2 = P1;
            isect2 = isect1;
        }
        isectP = ( P1.z > -u_depthRange.x || (P2.z < -u_depthRange.x && P1.z < P2.z ) ) ? P2 : P1;
        isIsect = mix( isect2, 1.0, isect1 ) * step( isectP.z, -u_depthRange.x );
    }
    
    float distance = length( isectP - vLightPos.xyz );
    float att =
    1.0 / (PBR.Atten.x + PBR.Atten.y * distance + PBR.Atten.z * distance * distance);        
    
    
    FragColor = vec4(SL.Color.rgb * SL.Color.a * isIsect * att, 1);
}