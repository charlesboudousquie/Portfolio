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

// ray-cylinder intersetion (returns t enter and exit)

//vec2 iCylinder( in vec3 ro, in vec3 rd, 
//                in vec3 pa, in vec3 pb, in float ra, in vec3 cc, in vec3 ca ) // point a, point b, radius, center, dir
//{
//    // center the cylinder, normalize axis
//    vec3 cc = 0.5*(pa+pb);
//    float ch = length(pb-pa);
//    ch *= 0.5;
//
//    vec3  oc = ro - cc;
//
//    float card = dot(ca,rd);
//    float caoc = dot(ca,oc);
//    
//    float a = 1.0 - card*card;
//    float b = dot( oc, rd) - caoc*card;
//    float c = dot( oc, oc) - caoc*caoc - ra*ra;
//    float h = b*b - a*c;
//    if( h<0.0 ) return vec4(-1.0);
//    h = sqrt(h);
//    float t1 = (-b-h)/a;
//    float t2 = (-b+h)/a; // exit point
//
//    float y1 = caoc + t1*card;
//    float y2 = caoc + t1*card;
//    // body
//    if( abs(y1)<ch ) return vec4( t1, t2 );
//    
//    // caps
//    //float sy1 = sign(y1);
//    //float tp1 = (sy1*ch - caoc)/card;
//    //if( abs(b+a*tp1)<h )
//    //{
//    //    return vec2( tp1, ca*sy );
//    //}
//
//    return vec2(-1.0);
//}

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
    vec3 PA = C + V * 40.0f;
    vec3 PB = C - V * 40.0f;
    float ch = 10.0f;

    vec3  OC = O - C;

    float VD = dot(V,D);
    float VOC = dot(V,OC);
    
    float a = 1.0 - VD*VD;
    float b = dot( OC, D) - VOC*VD;
    float ra = 5.0f;
    float c = dot( OC, OC) - VOC*VOC - ra*ra;
    float det = b*b - a*c;
    
    // find intersection
    float isIsect = 0.0;
    vec3  isectP  = vec3(0.0);
    if ( det >= 0.0 )
    { 
        det = sqrt(det);
        float t1 = (-b-det)/a;
        float t2 = (-b+det)/a; // exit point
        vec3  P1 = O + t1 * D;
        vec3  P2 = O + t2 * D;
        float isect1 = step( 0.0, dot(normalize(P1-PB), V) );
        float isect2 = step( 0.0, dot(normalize(P2-PB), V) );
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
    
    float distance = length( isectP - PB ) * 0.125;
    if (distance > 3) distance = 3.0 + 4.0 * smoothstep(3.0,7.0, distance);
    float att =
    1.0 / (PBR.Atten.x + PBR.Atten.y * distance + PBR.Atten.z * distance * distance);        
    
    
    FragColor = vec4(SL.Color.rgb * SL.Color.a * isIsect * att, 1);
}