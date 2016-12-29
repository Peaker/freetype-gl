/* Freetype GL - A C OpenGL Freetype engine
 *
 * Distributed under the OSI-approved BSD 2-Clause License.  See accompanying
 * file `LICENSE` for more details.
 */

// See "twopass-a.frag" for documentation

uniform sampler2D tex;
uniform vec3 pixel;

varying vec4 vcolor;
varying vec2 vtex_coord;
varying float vshift;
varying float vgamma;

void main()
{
    vec4 current = texture2D(tex, vtex_coord);
    vec4 previous= texture2D(tex, vtex_coord+vec2(-1.,0.)*pixel.xy);

    current = pow(current, vec4(1.0/vgamma));
    previous= pow(previous, vec4(1.0/vgamma));

    float r = current.r;
    float g = current.g;
    float b = current.b;

    if( vshift <= 0.333 )
    {
        float z = vshift/0.333;
        r = mix(current.r, previous.b, z);
        g = mix(current.g, current.r,  z);
        b = mix(current.b, current.g,  z);
    }
    else if( vshift <= 0.666 )
    {
        float z = (vshift-0.333)/0.333;
        r = mix(previous.b, previous.g, z);
        g = mix(current.r,  previous.b, z);
        b = mix(current.g,  current.r,  z);
    }
    else
    {
        float z = (vshift-0.666)/0.334;
        r = mix(previous.g, previous.r, z);
        g = mix(previous.b, previous.g, z);
        b = mix(current.r,  previous.b, z);
    }

    gl_FragColor = vec4( r * vcolor.r, g * vcolor.g, b * vcolor.b, vcolor.a );
}
