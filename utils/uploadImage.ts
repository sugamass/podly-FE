import { supabase } from "@/services/supabase";
import * as FileSystem from "expo-file-system";

export async function uploadAvatar(
  uri: string,
  userId: string
): Promise<string> {
  try {
    // ファイル拡張子を取得
    const fileExtension = uri.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${userId}-${Date.now()}.${fileExtension}`;

    // ファイルをbase64で読み込み
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // MIMEタイプを設定
    const mimeType = `image/${
      fileExtension === "jpg" ? "jpeg" : fileExtension
    }`;

    // バイナリデータに変換
    const arrayBuffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    // Supabase Storageにアップロード
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(fileName, arrayBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // 公開URLを取得
    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Image upload error:", error);
    throw new Error("画像のアップロードに失敗しました");
  }
}

export async function deleteAvatar(avatarUrl: string): Promise<void> {
  try {
    // URLからファイルパスを抽出
    const url = new URL(avatarUrl);
    const pathParts = url.pathname.split("/");
    const fileName = pathParts[pathParts.length - 1];

    if (!fileName) {
      return; // ファイル名が取得できない場合はスキップ
    }

    // Supabase Storageから削除
    const { error } = await supabase.storage.from("avatars").remove([fileName]);

    if (error && error.message !== "The resource was not found") {
      console.error("Avatar deletion error:", error);
      // 削除エラーはログに記録するが、メイン処理は継続
    }
  } catch (error) {
    console.error("Avatar deletion error:", error);
    // 削除エラーはログに記録するが、メイン処理は継続
  }
}
