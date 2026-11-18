/* Portable C17 investigation — REPORT, DON'T ASSUME native struct layout.
 *
 * On your own system:
 *   cc -std=c17 -Wall -Wextra -Wpedantic -Werror pilot/labs/struct_layout_demo.c -o struct_layout_demo
 *   ./struct_layout_demo
 *
 * The output depends on your ABI/compiler; there are no hard-coded expected offsets.
 */
#include <stdio.h>
#include <stddef.h>
#include <stdint.h>

typedef struct {
    float x;
    uint8_t health;
    float y;
} Fish;

int main(void) {
    printf("sizeof(float)=%zu\n", sizeof(float));
    printf("_Alignof(float)=%zu\n", _Alignof(float));
    printf("sizeof(Fish)=%zu\n", sizeof(Fish));
    printf("_Alignof(Fish)=%zu\n", _Alignof(Fish));
    printf("offsetof(Fish,x)=%zu\n", offsetof(Fish, x));
    printf("offsetof(Fish,health)=%zu\n", offsetof(Fish, health));
    printf("offsetof(Fish,y)=%zu\n", offsetof(Fish, y));
    return 0;
}
