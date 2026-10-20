package com.chrisgonzalez.videogametracker.domain;

public enum EsrbRating {
    EC("EC"),
    E("E"),
    E10_PLUS("E10+"),
    T("T"),
    M("M"),
    AO("AO"),
    RP("RP");

    private final String value;

    EsrbRating(String value) {
        this.value = value;
    }

    public String value() {
        return value;
    }

    public static EsrbRating fromValue(String value) {
        for (EsrbRating rating : values()) {
            if (rating.value.equals(value)) {
                return rating;
            }
        }
        throw new IllegalArgumentException("Unsupported ESRB rating: " + value);
    }
}
