// mandelbrot.cpp
#include <cmath>
#include <cstdint>


struct Complex {
    double real;
    double imaginary;

    Complex(double r, double i) : real(r), imaginary(i) {}

    Complex add(const Complex& other) const {
        return Complex(real + other.real, imaginary + other.imaginary);
    }

    Complex square() const {
        double r = real * real - imaginary * imaginary;
        double i = 2 * real * imaginary;
        return Complex(r, i);
    }

    double abs() const {
        return std::sqrt(real * real + imaginary * imaginary);
    }
};

extern "C" {
    int32_t mandelbrot(double xcoord, double ycoord, int32_t maxIterations) {
        Complex c(xcoord, ycoord);
        Complex z(0, 0);
        int32_t iterations = 0;

        while (z.abs() < 2 && iterations < maxIterations) {
            z = z.square().add(c);
            iterations++;
        }

        return iterations;
    }
}