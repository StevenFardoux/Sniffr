#include <Color.hpp>

namespace Color
{
    const char *red(String text)
    {
        return (_RED + text + _RESET).c_str();
    }

    const char *green(String text)
    {
        return (_GREEN + text + _RESET).c_str();
    }

    const char *gray(String text)
    {
        return (_GRAY + text + _RESET).c_str();
    }
}