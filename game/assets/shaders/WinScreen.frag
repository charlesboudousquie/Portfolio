/**
* @file WinScreen.frag
* @author Harry Humphries
* @date 10/20/2018
* @brief Fun lil background.
* @details
* @par Project Abyss
* @par Copyright(C) 2018 DigiPen Institute of Technology
*/
#version 430 core

const float R3 = 1.732051;

uniform float iTime;
out vec4 FragColor;
in vec2 TexCoords;


vec4 HexCoords(vec2 uv) {
    vec2 s = vec2(1, R3);
    vec2 h = fract(.5*s);

    vec2 gv = s*uv;
    
    vec2 a = mod(gv, s)-h;
    vec2 b = mod(gv+h, s)-h;
    
    vec2 ab = dot(a,a)<dot(b,b) ? a : b;
    vec2 st = ab;
    vec2 id = gv-ab;// + vec2(1);
    
   // ab = abs(ab);
    //st.x = .5-max(dot(ab, normalize(s)), ab.x);
	st = ab;
    return vec4(st, id);
}

float N(float p) {
    return 1.;
}

float GetSize(vec2 id, float seed) {
    float d = (sin(iTime*.1) + .2) * length(id);
    float t = sin(iTime*.1);
    float a = 2. * sin(d+t);// +sin(d*seed+t);
    return a/2. +.5;
}

mat2 Rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
}

float Hexagon(vec2 uv, float r, vec2 offs) {
    
    uv *= Rot(mix(-3.1415, 3.1415, r));
    
    r /= 1./sqrt(2.);
    uv = vec2(uv.y, uv.x);
    uv.x *= R3;
    uv = abs(uv);
    
    vec2 n = normalize(vec2(1,1));
    float d = dot(uv, n)-r;
    d = max(d, uv.y-r*.707);
    
    d = smoothstep(.06, .02, abs(d));
    
    //d += smoothstep(.1, .11, (r-.5));//*sin(iTime);
    return d;
}

float Xor(float a, float b) {
	//return a+b;
    return a*(1.-b) + b*(1.-a);
}

float Layer(vec2 uv, float s) {
    vec4 hu = HexCoords(uv*2.);

    float d = Hexagon(hu.xy, GetSize(hu.zw, s), vec2(sin(iTime), cos(iTime)));
    return d;
}

void main()
{
    vec2 uv = TexCoords - vec2(0.5);
	
    uv *= mat2(.707, -.707, .707, .707);
    uv *= 2.;
    float duv = dot(uv,uv);
    vec2 gv = sin(uv)-.5;
    
    FragColor = vec4(0,0,0,1);
    vec3 m = vec3(0.);
    float t = .5 * iTime*.2+m.x*10.+5.;
    for(float x=-1.; x<=1.; x+= 0.5) 
    {
        vec2 offs = vec2(x, 0);

        float id = floor(x+t);
        t = -iTime+length(id-offs)*.2;
        float r = mix(.4, 1.5, sin(t)*.5+.5);
        vec3 c = normalize(Layer(uv, N(x))) * vec3(.5*(sin(t))+.5,.5*(sin(t*.5))+.5,.5*cos(t) + .5);//*Col(id,duv);
        m += c*c;
    }
    vec3 myCol = (m);
    FragColor = vec4(myCol,1);
}
