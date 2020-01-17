/**
* @file CameraEffect.frag
* @author Timothey Goodwin
* @date 4/3/2019
* @breif This file has functionality for Camera Effects.
* @details
* @par Project Abyss
* @par Copyright(C) 2019 DigiPen Institute of Technology
*/
#version 430 core

out vec4 FragColor;

in vec2 TexCoords;

//layout(binding = 0) uniform sampler2D AlphaMask;
uniform vec4 info;

void main()
{
    //vec3 effectmask = texture(AlphaMask, TexCoords).rgb;
    vec3 color = vec3(0,0,0);
	vec3 red = vec3(.3,0,0);
	vec3 green = vec3(0,.3,0);
	vec3 blue = vec3(0,0,.3);
	vec3 health = vec3(.6,0,0);
	vec3 effect = vec3(0,0,0);
	if(info.r != 0)
	{
	    effect += red;
	}
    if(info.g != 0)
	{
	    effect += green;
	}
	if(info.b != 0)
	{
	    effect += blue;
	}
	color += health * (1.0f - info.a);
	color += effect;
	FragColor = vec4(color,1.0f);
}

