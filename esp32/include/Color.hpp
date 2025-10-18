#pragma once
#ifndef SIM7080G_COLOR_H
#define SIM7080G_COLOR_H
#include <Arduino.h>

namespace Color
{
    constexpr const char *_RESET = "\033[0m";     // Reset color
    constexpr const char *_BOLD = "\033[1m";      // Bold text
    constexpr const char *_UNDERLINE = "\033[4m"; // Underline text
    constexpr const char *_ITALIC = "\033[3m";    // Italic text
    constexpr const char *_BLACK = "\033[30m";    // Black text
    constexpr const char *_RED = "\033[31m";      // Red text
    constexpr const char *_WHITE = "\033[37m";    // White text
    constexpr const char *_YELLOW = "\033[33m";   // Yellow text
    constexpr const char *_BLUE = "\033[34m";     // Blue text
    constexpr const char *_CYAN = "\033[36m";     // Cyan text
    constexpr const char *_MAGENTA = "\033[35m";  // Magenta text
    constexpr const char *_GRAY = "\033[90m";     // Gray text
    constexpr const char *_GREEN = "\033[32m";    // Green text

    const char *red(String text);
    const char *green(String text);
    const char *gray(String text);

}

#endif // SIM7080G_COLOR_H