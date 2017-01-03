/* Freetype GL - A C OpenGL Freetype engine
 *
 * Distributed under the OSI-approved BSD 2-Clause License.  See accompanying
 * file `LICENSE` for more details.
 */

// True subpixel rendering via two rendering passes.
/////////////////////////////////////////////////////
// "twopass-a.frag" and "twopass-b.frag" should be linked with "text.vert".
//
// See description in section 6 of
// https://fsrv.dyndns.org/mirrors/dmedia-tutorials-textrendering1/index.html
// Note that if rendering single-color text, and GL supports gl_ext_blend_color,
// you can use a single rendering pass as described in section 6.1
//
// The first pass: Occlusion
// Use "twopass-a.frag" with "glBlendFunc( GL_ZERO, GL_ONE_MINUS_SRC_COLOR );"
// ( This works around OpenGL not allowing different alpha for each subpixel,
//   and uses the color components as subpixel alpha channels )
//
// The second pass: Color
// Use "twopass-b.frag" with "glBlendFunc( GL_SRC_ALPHA, GL_ONE );".
//
// For usage example see "demos/atb-agg.c".

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

    float r;
    float g;
    float b;

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

    gl_FragColor = vec4( r * vcolor.a, g * vcolor.a, b * vcolor.a, 1 );
}
