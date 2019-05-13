/**
* @file EntityPtrBuffer.frag
* @author Harry Humphries
* @date 10/20/2018
* @brief Writes pointer to buffer
* @details
* @par Project Abyss
* @par Copyright(C) 2018 DigiPen Institute of Technology
*/
#version 430 core

layout(location = 0) out vec4 Entity64;
layout(location = 1) out vec4 Entity32;

uniform vec4 EntityPtr64;
uniform vec4 EntityPtr32;

void main()
{
    Entity64 = EntityPtr64;
    Entity32 = EntityPtr32;
}

