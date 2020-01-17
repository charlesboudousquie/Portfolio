#version 430 core

layout(std140, binding = 4) uniform Display
{
    vec4 color;
    vec4 pos;
    vec3 scale;
    int usingTexture;
}display;



in VS_OUT{
    flat vec4 color;
    vec2 UV;
}fs_in;

uniform sampler2D sprite;

out vec4 color;

void main()
{
    if(display.usingTexture != 0)
    {
        const vec4 samp = texture(sprite, fs_in.UV);
        const float brightness = (samp.r + samp.g + samp.b) / 3.0;
        color.rgb = display.color.rgb * samp.rgb;
        color.a = brightness * display.color.a;
    }
    else
    {
        color = display.color;
    }
    
    color *= fs_in.color;
}