#version 430 core

layout(std140, binding = 4) uniform DisplayStruct
{
    vec4 color;
    vec4 pos;
    vec3 scale;
    int usingTexture;
}display;

layout(std140, binding = 5) uniform ColorAnimation
{
    vec4 colors[5];
    float lifetime;
}colorAnimation;

uniform vec3 lookAt;
uniform mat4 view;
uniform mat4 projection;

// instanced attributes
layout(location = 0) in vec3  offset;
layout(location = 1) in float rotation;
layout(location = 2) in float size;
layout(location = 3) in float lifetime;

layout(location = 4) in vec2  vertPos;


out VS_OUT{
    flat vec4 color;
    vec2 UV;
}vs_out;

void Position()
{
    const vec3 cameraUp    = vec3(view[0][0], view[1][0], view[2][0]);
    const vec3 cameraRight = vec3(view[0][1], view[1][1], view[2][1]);
    
    const float sint = sin(rotation);
    const float cost = cos(rotation);
    
    const mat2 rotate = mat2(
        vec2( cost,  sint),
        vec2(-sint,  cost)
    );
    
    const vec2 vertRotPos = rotate * vertPos;
    
    const vec3 worldPos = display.pos.xyz + offset +
        + cameraRight * vertRotPos.x * display.scale.x * size
        + cameraUp    * vertRotPos.y * display.scale.y * size;
        
    const vec4 viewPos = view * vec4(worldPos, 1);
    
    gl_Position = projection * viewPos;
}

void Color()
{
    const float epsilon = 0.0001;
    const float intermed = 4 * clamp((1.0 - lifetime / colorAnimation.lifetime), epsilon, 1 - epsilon);
    const float whole = floor(intermed);
    const float lerp = intermed - whole;
    const uint index = uint(whole);
    
    const vec4 color1 = colorAnimation.colors[index];
    const vec4 color2 = colorAnimation.colors[index + 1];
    
    const vec4 mixResult = mix(color1, color2, lerp);
    vs_out.color = mixResult;
    vs_out.UV = 0.5 * (vertPos + 1);
}


void main()
{
    Position();

    Color();
}