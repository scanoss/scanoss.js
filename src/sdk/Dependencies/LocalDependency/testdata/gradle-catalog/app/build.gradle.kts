plugins {
    id("com.android.application")
    kotlin("android")
}

dependencies {
    implementation(libs.hilt.android)
    testImplementation(libs.junit)
    implementation(libs.core.ktx)
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
}
