import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/entrar", "/cadastro", "/esqueci-senha"],
        disallow: [
          "/api/",
          "/dashboard",
          "/biblia",
          "/biblioteca",
          "/devocional",
          "/escatologia",
          "/estudo",
          "/historia",
          "/oracoes",
          "/perfil",
          "/plano",
          "/redefinir-senha",
        ],
      },
    ],
  }
}
