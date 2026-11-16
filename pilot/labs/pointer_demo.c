#include <stdio.h>

int main(void) {
    int x = 42;
    int *ptr = &x;
    printf("%d\n", *ptr);
    x = 73;
    printf("%d\n", *ptr);
    return 0;
}