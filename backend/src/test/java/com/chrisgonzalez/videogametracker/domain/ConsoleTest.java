package com.chrisgonzalez.videogametracker.domain;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ConsoleTest {

    @Test
    void acceptsNonblankName() {
        assertEquals("Nintendo Switch", new Console("Nintendo Switch").name());
    }

    @Test
    void rejectsBlankName() {
        assertThrows(IllegalArgumentException.class, () -> new Console(" \t "));
    }

    @Test
    void rejectsNullName() {
        assertThrows(NullPointerException.class, () -> new Console(null));
    }
}
